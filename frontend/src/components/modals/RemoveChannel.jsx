import React, { useState } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSocket } from '../../hooks';
import {toast} from "react-toastify";

const RemoveChannel = ({ onExited }) => {
    const [show, setShow] = useState(true);
    const [pending, setPending] = useState(true);
    const { t } = useTranslation();
    const { channelId } = useSelector((state) => state.modal.extra);
    const socket = useSocket();

    const onHide = () => {
        setShow(false);
        toast.success(t('channels.removed'));
    };

    const handleRemoveChannel = () => {
        setPending(true);

        const channel = { id: channelId };

        socket.emit('removeChannel', channel, ({ status }) => {
            if (status === 'ok') {
                onHide();
            }
        });
    };

    return (
        <Modal show={show} onHide={onHide} onExited={onExited}>
            <Modal.Header closeButton>
                <Modal.Title>{t('texts.removeChannel')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{t('texts.areYouSure')}</Modal.Body>
            <Modal.Footer>
                <div>
                    <Button
                      type='button'
                      variant='secondary'
                      className='mr-2'
                      onClick={onHide}
                      disabled={pending}
                      >{t('buttons.cancel')}</Button>
                      <Button
                        type='button'
                        variant='danger'
                        data-testid='remove-channel'
                        disabled={pending}
                        onClick={handleRemoveChannel}
                        >{pending && <Spinner className='mr-1' animation='border' size='sm' />}{t('buttons.remove')}</Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default RemoveChannel 