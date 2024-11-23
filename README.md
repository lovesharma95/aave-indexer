# aave-indexer

An Indexer for aUSDC Aave Contract to Monitor Liquidation Parameters

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js**: Version **v21.7.1**
- **npm**: Version **10.8.3**
- **PostgreSQL**: A running PostgreSQL instance for database setup

## Installation

Clone the repo:

```bash
git clone https://github.com/lovesharma95/aave-indexer.git
cd aave-indexer
```

Install the dependencies:

```bash
npm install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Commands

Running locally:

```bash
npm run dev
```

Running in production:

```bash
npm start
```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
#Server environment
NODE_ENV=dev
#Port number
PORT=3000

#Websocket configuration
WEBSOCKET_EXPECTED_PONG_BACK_DURATION=10000
WEBSOCKET_KEEP_ALIVE_CHECK_INTERVAL=30000

#Db configuration
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=

#Blockchain configuration
AUSDC_ADDRESS=
LENDING_POOL_ADDRESS=
WEBSOCKET_RPC_URL=

```

Modify the `.env` values.

## Project Structure

```
src\
 |--config\         	# Environment variables and configuration related things
 |--controllers\    	# Route controllers (controller layer)
 |--assets\         	# ABI files
 |--db\             	# Migrations, data source and entity files
 |--services\       	# DB Logic
 |--helper\         	# Helper classes and functions
 |--missedEvents\       # missed and past events
 |--eventListener.ts	# websocket connection
 |--index.ts        	# App entry point
```
