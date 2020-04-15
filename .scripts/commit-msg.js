#!/usr/bin/env node

const fs = require('fs');
const emoji = require('node-emoji');

const {HUSKY_GIT_PARAMS: gitMessagePath} = process.env;

const message = fs.readFileSync(gitMessagePath, {encoding: 'utf8'});

const messageLines = message.split('\n');
messageLines[0] = emoji.emojify(messageLines[0]);
fs.writeFileSync(gitMessagePath, messageLines.join('\n'), {encoding: 'utf-8'});
