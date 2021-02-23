This is a single controller app. The routes exist at /employees.

Documentation at https://documenter.getpostman.com/view/5539822/TWDXmwEi

This app is protected by a VPN. Users are required to connect via whitelisted IP addresses as proxies.

For `testing`, the following links are useful.
- List of proxy addresses to test with https://www.proxynova.com/proxy-server-list/
- Configure postman to make requests though selected IP proxies. https://learning.postman.com/docs/sending-requests/capturing-request-data/proxy/#configuring-proxy-settings

For `unit tests`
- clone repo
- install nestjs `npm i -g @nestjs/cli`
- at repo root directory in terminal, run `npm run test:cov`. This will run all `unit tests` and generate `coverage`. Alternatively, you can view coverage in the `coverage` directory.
 
Deploy with Docker:
- `docker-compose up`

