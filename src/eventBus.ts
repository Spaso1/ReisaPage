import mitt from 'mitt';

type Events = {
    'refresh-user-info': void;
};

const eventBus = mitt<Events>();

export default eventBus;
