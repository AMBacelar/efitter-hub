import { Container, Loader, Image } from 'semantic-ui-react';
import { Button, Card, Segment, Dimmer } from 'semantic-ui-react';
import {
  gapiLoaded,
  gisLoaded,
  handleAuthClick,
  handleSignoutClick,
} from '@efitter-hub/gmail';
import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { emailValidator } from '../utils/emailValidator';
import { BrandValue, getCategory } from '@efitter-hub/efiter-lib';
import styles from './index.module.scss';

const loadScript = (url, id, onLoad) => {
  const firstJs = document.getElementsByTagName('script')[0];

  if (document.getElementById(id)) {
    return;
  }
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = url;
  script.onload = () => onLoad();
  firstJs.parentNode.insertBefore(script, firstJs);
};

const ItemInfo = ({
  items,
}: {
  items: { brand: BrandValue; name: string; size: string }[];
}) => {
  const itemList = items.map((item, i) => {
    const { brand, size } = item;
    let { name } = item;
    let validName;
    let category;
    const sizeError = !size;

    try {
      category = getCategory(name);
      if (category) {
        validName = true;
      }
    } catch (error) {
      validName = false;
      category = '';
      name = 'Name not Found';
    }

    const isErrorPresent = !validName || sizeError || !brand;

    return (
      <Segment color={isErrorPresent ? 'red' : 'green'} key={i}>
        <div className={!validName && styles['error-message']}>{`${name} ${
          category ? `[${category}]` : `[unsupported category]`
        }`}</div>
        <div className={brand ? '' : styles['error-message']}>{brand}</div>
        <div className={sizeError && styles['error-message']}>
          {size || 'Valid size not found'}
        </div>
      </Segment>
    );
  });
  return (
    <div>
      <p className={items.length === 0 && styles['error-message']}>
        {items.length ? `items: ${items.length}` : 'no items found'}
      </p>
      <div>{itemList}</div>
    </div>
  );
};

const MailItem = ({ mailItem, fluid, onClick }) => {
  // TO GET MESSAGE BODY
  const getBody = (misc) => {
    if (misc.parts) {
      return getBody(misc.parts[0]);
    }
    return misc.body.data;
  };
  const data = getBody(mailItem.payload);

  let messageBody;

  if (data === undefined) {
    console.log('$$!', mailItem);
    return null;
  }

  if (data) {
    messageBody = atob(
      decodeURIComponent(data.replace(/-/g, '+').replace(/_/g, '/'))
    );
  }

  const from =
    mailItem.payload.headers.filter((x) => x.name == 'From')[0]?.value || '';
  const subject =
    mailItem.payload.headers.filter((x) => x.name == 'Subject')[0]?.value || '';
  const date = mailItem.payload.headers.filter(
    (x) => x.name == 'Date' || x.name == 'date'
  )[0]?.value;

  let isValidSubjectLine, items;

  try {
    const product = emailValidator(messageBody, subject);
    isValidSubjectLine = product.isValidSubjectLine;
    items = product.items;
  } catch (error) {
    isValidSubjectLine = false;
    items = [];
  }

  if (!isValidSubjectLine) return null;

  const handleClick = () => onClick(messageBody);

  return (
    <Card onClick={handleClick} fluid={fluid}>
      <Card.Content>
        <Card.Meta>{date}</Card.Meta>
        <Card.Header>{subject}</Card.Header>
        <Card.Description>{from}</Card.Description>
        <Card.Content extra>
          <ItemInfo items={items} />
        </Card.Content>
      </Card.Content>
    </Card>
  );
};

export function Index() {
  const [hasToken, setHasToken] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [maxWidth, setMaxWidth] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMessageBody, setCurrentMessageBody] = useState('');

  useEffect(() => {
    loadScript('https://apis.google.com/js/api.js', 'api', () => gapiLoaded());
    loadScript('https://accounts.google.com/gsi/client', 'gsi', () =>
      gisLoaded()
    );
    if (sessionStorage.getItem('token')) setHasToken(true);
  }, []);
  useEffect(() => {
    const _token = sessionStorage.getItem('token');
    setToken(_token);
  }, [hasToken]);

  const handleSearch = async () => {
    const messageList = await getMessages();

    const results = [];
    for (const message of messageList) {
      const _message = fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      results.push(_message);
    }
    const final = [];
    const result = await Promise.allSettled(results);
    for (let index = 0; index < result.length; index++) {
      const singleResult = result[index];
      if (singleResult.status === 'fulfilled') {
        final.push(await singleResult.value.json());
      }
    }
    setMessages(final);
    return;
  };

  const getMessages = async (): Promise<any> => {
    return new Promise((resolve) => {
      const subjects = {
        zara: 'Thank you for your purchase',
        asos: 'Thanks for your order',
        prettyLT: 'Your order confirmation',
        boohoo: 'Your boohoo order confirmation',
        mango: 'Thank you for shopping at MANGO',
        misguided: 'Missguided: Order Confirmation',
        hnm: 'Order confirmation',
        stradivarius: 'Thanks for your purchase',
        massimoDutti: 'Confirmation of order nº',
        houseOfCB: 'HouseofCB.com Order',
        ms: 'Thanks for shopping with us',
      };
      const search = `${Object.keys(subjects)
        .map((key) => `subject:"${subjects[key]}"`)
        .join(' ')}`;

      let result = [];
      let nextPageToken;
      let tokenPageParam = '';

      const fetchNow = async () => {
        if (nextPageToken) {
          tokenPageParam = '&pageToken=' + nextPageToken;
        }
        const resp = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500&includeSpamTrash=false${tokenPageParam}&q={${search}} after: ${new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          )
            .toLocaleDateString()
            .split('/')
            .reverse()
            .join('/')}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const response = await resp.json();
        result = [...result, ...response.messages];
        if (response.nextPageToken) {
          nextPageToken = response.nextPageToken;
          return fetchNow();
        }
        return result;
      };

      fetchNow()
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.log('err:', err);
        });
    });
  };

  const handleOpenModal = (data) => {
    const temp = document.createElement('div');
    temp.innerHTML = data;
    let sanitized = temp.textContent || temp.innerText;
    const index = sanitized.indexOf('}}');
    if (index !== -1) {
      sanitized = sanitized.slice(index + 2);
    }
    setCurrentMessageBody(sanitized);
    setIsModalOpen(true);
  };

  const messageList = messages.map((message) => {
    return (
      <MailItem
        key={message.id}
        mailItem={message}
        fluid={maxWidth}
        onClick={handleOpenModal}
      />
    );
  });

  return (
    <Container>
      <h1>Email Scraper</h1>
      <Segment>
        <p>
          I would strong suggest using the browser Find command [cmd+f] to
          quickly traverse all these items
        </p>
        <Button
          id="authorize_button"
          onClick={() =>
            handleAuthClick(() => {
              setHasToken(true);
            })
          }
          type="button"
          disabled={hasToken}
        >
          authorize
        </Button>
        <Button
          id="signout_button"
          onClick={() => {
            setToken(null);
            setHasToken(false);
            handleSignoutClick();
          }}
          type="button"
          disabled={!hasToken}
        >
          sign out
        </Button>
        <Button
          disabled={!hasToken}
          onClick={async () => {
            try {
              setMessages([]);
              setIsLoading(true);
              await handleSearch();
              setIsLoading(false);
            } catch (error) {
              console.log('mess up!', error);
            }
          }}
          type="button"
        >
          Click here to search
        </Button>
        <Button toggle active={maxWidth} onClick={() => setMaxWidth(!maxWidth)}>
          Toggle Card Width
        </Button>
      </Segment>
      <Dimmer.Dimmable as={Segment} dimmed={isLoading}>
        <Dimmer active={isLoading}>
          <Loader size="massive" content="Loading..." />
        </Dimmer>
        {isLoading && (
          <p>
            <Image
              alt="Loading"
              src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png"
            />
          </p>
        )}
        <Card.Group centered>{messageList}</Card.Group>
      </Dimmer.Dimmable>

      <ReactModal
        isOpen={isModalOpen}
        shouldFocusAfterRender={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        shouldReturnFocusAfterClose={true}
        preventScroll={false}
        parentSelector={() => document.body}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <h2>Modal Content</h2>
        <div dangerouslySetInnerHTML={{ __html: currentMessageBody }} />
      </ReactModal>
    </Container>
  );
}

export default Index;
