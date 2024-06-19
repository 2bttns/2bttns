# Welcome to 2bttns 👋

<a href="https://2bttns.com"><img src="https://img.shields.io/badge/official site-2bttns.com-green.svg?style=for-the-badge"></a>
<a href="https://docs.2bttns.com/"><img src="https://img.shields.io/badge/docs-v1.0.0_beta-green.svg?style=for-the-badge"></a>
<a href="https://hub.docker.com/r/2bttns/2bttns"><img src="https://img.shields.io/badge/docker hub-2bttns/2bttns-blue.svg?logo=docker&style=for-the-badge"></a>
<a href="https://discord.com/invite/YkjQNyhmsT"><img src="https://img.shields.io/badge/chat-discord-yellow.svg?logo=discord&style=for-the-badge"></a>

## What is 2bttns ❓
**Integrate** a two-button game to **collect** user data and **tailor** **content** with a few lines of code. 

**Ethical Data Collection🤔**: Grounded in human-in-the-loop design, 2bttns ensures that data-driven feeds remain ethical by enhancing algorithmic transparency and reducing bias, all without compromising the user experience.


## Getting Started 🏁
Read the [Quick Start tutorial](https://docs.2bttns.com/getting-started/quick-start) or start by following the steps below:

**Installation ⏳**

Install and use 2bttns in your project using this quick command (any where) to create a 2bttns Console instantly:

```shell
# You can install the 2bttns CLI globally via npm:
npm i -g @2bttns/2bttns-cli
```

```shell
# Alternatively, you can call it via npx without installing it globally.
npx @2bttns/2bttns-cli <command>
```

(Ensure Docker is running! 🐳)

```shell
2bttns-cli new
```

This command will:

- Create a `docker-compose.yml` file in the current directory.
- Launch your Console at http://localhost:3262/.
- Apply migrations to your specified PostgreSQL database.
- Optionally seed the database with example data.

The new command installs 2bttns with an optional PostgreSQL database, which can be swapped out later if needed.

Enjoy 🎉

## How this repository is organized 🔍
This repository contains the following folders:

- [`app/`](https://github.com/2bttns/2bttns/tree/main/app) - the core 2bttns web application that provides an Admin Panel, REST API, and User Interface for users to play games.

- [`examples/`](https://github.com/2bttns/2bttns/tree/main/examples/2bttns-example-app-next) - example applications that demonstrate common use cases of 2bttns.

- [`packages/`](https://github.com/2bttns/2bttns/tree/main/packages) - packages that interact with 2bttns. Includes the official [2bttns Node.js SDK](https://github.com/2bttns/2bttns/tree/main/packages/2bttns-sdk) and the[`2bttns CLI`](https://github.com/2bttns/2bttns/tree/main/packages/cli) tool.


## License 👔
2bttns is licensed under the [2bttns License 1.0](./profile/2bttns_LICENSE.md).

- 🟢 **USE** the source code
- 🟢 **MODIFY** the source code
- 🟢 **DISTRIBUTE** copies of the original or modified source code
- 🟢 **USE** the software for personal or commercial purposes
- 🟢 **DISTRIBUTE** copies of the software in source or object form
- 🟢 **INCLUDE** the license in your distributions
- 🟢 **REPRODUCE** the copyright notice
- 🟢 **MENTION** attribution notices in derivative works
- 🟢 **INFORM** recipients of derivative works where they can obtain a copy of the original software (by including licence)

- ❌ **SUBLICENSE** the software
- ❌ **TAKE CREDIT** through trademarks or white labeling the source code
- ❌ **HOLD US LIABLE** for any claims or damages arising from the use of the software

Remember to consult the full 2bttns License 1.0 for complete details and accurate information.

## Contributing 🌍
We're building 2bttns out in the open. We welcome contributions from the community to improve and enhance 2bttns. If you have any bug fixes, feature requests, or suggestions, please open an issue or submit a pull request to the [2bttns GitHub repository](https://github.com/2bttns/2bttns).

Please ensure that your contributions adhere to the [Contributor Covenant Code of Conduct](./profile/CODE_OF_CONDUCT.md).

## Contact 🗣️
For any inquiries or questions, please contact our support team at friends@2bttns.com.

Visit our website at [www.2bttns.com](https://www.2bttns.com) for more information about 2bttns and our other products.
