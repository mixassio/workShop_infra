import App from '..';

const port = process.env.PORT || 5000;
App().listen(port, () => console.log(`port: ${port}`));