import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Col,
  Form,
  InputGroup,
  Button,
  Spinner,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';

import { useSocket } from "../hooks";
import { messageSchema } from '../validations.js';
import leoProfanity from "leo-profanity";

const getUsername = () => localStorage.getItem('username');

const InfoDivBlock = () => {
  const { channels, currentChannelId } = useSelector((state) => state.channelsInfo);
  const { messages } = useSelector((state) => state.messagesInfo);
  const channel = channels.find((ch) => ch.id === currentChannelId);
  const message = messages.filter((m) => m.channelId === currentChannelId);
  const { t } = useTranslation();

  return (
      <div className="bg-light mb-4 p-3 shadow-sm small">
        <p className="m-0">
          <b>
            {`# ${channel?.name}`}
          </b>
        </p>
        <span className="text-muted">
          {`${message.length} ${t('texts.messageCount', { count: message.length })}`}
        </span>
      </div>
  )
}

const MessagesBox = () => {
  const { currentChannelId } = useSelector((state) => state.channelsInfo);
  const { messages } = useSelector((state) => state.messagesInfo);

  return (
      <div id="messages-box" className="chat-messages overflow-auto px-5">
        {messages
          .filter(({ channelId }) => (Number(channelId) === currentChannelId))
          .map(({ id, body, username }, i) => {
            const isSameUser = (i !== 0 && messages[i - 1].username === username);
            return (
              <div key={id} className={(i === 0 || isSameUser) ? '' : 'mb-2'}>
                {!isSameUser
                  && <b>{username}</b>}
                <div className="text-break">{body}</div>
              </div>
            );
          })}
      </div>
  );
};

const NewMessageForm = () => {
  const { currentChannelId } = useSelector((state) => state.channelsInfo);
  const inputRef = useRef();
  const socket = useSocket();

  const formik = useFormik({
    initialValues: {
      body: '',
    },
    validationSchema: messageSchema,
    onSubmit: ({ body }, { resetForm, setSubmitting }) => {
      setSubmitting(true);
      const filteredBody = leoProfanity.clean(body);

      const message = { body: filteredBody, channelId: currentChannelId, username: getUsername() };
      socket.emit('newMessage', message, ({ status }) => {
        if (status === 'ok') {
          setSubmitting(false);

          resetForm();
          inputRef.current.focus();
        }
      });
    },
  });

  const { t } = useTranslation();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <div className="mt-auto px-5 py-3">
      <Form noValidate onSubmit={formik.handleSubmit} className="py-1 border rounded-2">
        <InputGroup hasValidation={formik.errors.body}>
          <Form.Control
            name="body"
            aria-label="?????????? ??????????????????"
            data-testid="new-message"
            placeholder="?????????????? ??????????????????..."
            className="border-0 p-0 ps-2"
            onChange={formik.handleChange}
            value={formik.values.body}
            isInvalid={formik.errors.body}
            ref={inputRef}
            readOnly={formik.isSubmitting}
          />
            <Button type="submit" disabled={formik.isSubmitting} className="btn btn-group-vertical">
              {formik.isSubmitting
                && <Spinner className="mr-1" animation="border" size="sm" />}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                <path fillRule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z">
              </path>
              </svg>
              <span className="visually-hidden">{t('buttons.send')}</span>
            </Button>
          {formik.errors.body
            && <Form.Control.Feedback type="invalid">{t(formik.errors.body)}</Form.Control.Feedback>}
        </InputGroup>
      </Form>
    </div>
  );
};

const Messages = () => (
  <Col className="p-0 h-100">
    <div className="d-flex flex-column h-100">
      <InfoDivBlock />
      <MessagesBox />
      <NewMessageForm />
    </div>
  </Col>
);

export default Messages;