
start:
	DEBUG=app npx nodemon --watch .  --ext '.js' --exec npx gulp server

start-prod:
	npm run sequelize db:migrate
	node ./dist/bin/app.js

lint:
	npm run eslint .

publish:
	npm publish

test:
	npm test

build:
	rm -rf public && npm run build-app
	rm -rf dist && npm run build-server
