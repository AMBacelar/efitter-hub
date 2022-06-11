import { Container, Loader, Image } from 'semantic-ui-react';
import { Button, Card, Segment, Dimmer } from 'semantic-ui-react';
import {
  gapiLoaded,
  gisLoaded,
  handleAuthClick,
  handleSignoutClick,
} from '@efitter-hub/gmail';
import React, { useEffect, useState } from 'react';
import { emailValidator } from '../utils/emailValidator';

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

const MailItem = ({ mailItem, fluid }) => {
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

  const { isValidSubjectLine, items } = emailValidator(messageBody, subject);

  if (!isValidSubjectLine) return null;

  return (
    <Card fluid={fluid}>
      <Card.Content>
        <Card.Meta>{date}</Card.Meta>
        <Card.Header>{subject}</Card.Header>
        <Card.Description>{from}</Card.Description>
        <Card.Content extra>
          snippet: {mailItem.snippet || 'no snippet'}
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
    const result = await Promise.all(results);
    for (let index = 0; index < result.length; index++) {
      const singleResult = result[index];
      final.push(await singleResult.json());
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
      const search = `subject:${Object.keys(subjects)
        .map((key) => `(${subjects[key]})`)
        .join(' OR ')}`;

      let result = [];
      let nextPageToken;
      let tokenPageParam = '';

      const fetchNow = async () => {
        if (nextPageToken) {
          tokenPageParam = '&pageToken=' + nextPageToken;
        }
        const resp = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500&includeSpamTrash=false${tokenPageParam}&q=${search}`,
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

  const messageList = messages.map((message) => {
    return <MailItem key={message.id} mailItem={message} fluid={maxWidth} />;
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
    </Container>
  );
}

export default Index;
