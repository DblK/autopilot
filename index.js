const { EventEmitter } = require('events');
const assert = require('assert');
const debug = require('debug')('cicp:autopilot');

class ConfigLoader extends EventEmitter {
  /**
   *
   * @constructor
   */
  constructor() {
    super();
    debug('constructor');

    this.commands = [];
  }

  /**
   * Set additional properties after object constructor
   *
   * @param {{logger: object}} param Additional Object
   */
  setInitialProperties({ logger }) {
    // debug('setInitialProperties');
    assert(logger, 'Logger must be present');
    this.logger = logger;
  }

  /**
   * Handle Request to dynamically load configuration
   *
   * @param {http.ClientRequest} req Request
   * @param {http.ServerResponse} res Response
   * @param {Promise} next Pass to the next registered function
   */
  handleRequest(req, res, next) {
    // Check for known headers
    const customHeaders = [];
    Object.keys(req.headers).forEach((header) => {
      if (header.toLowerCase().indexOf('x-dblk-cicp') === 0) {
        customHeaders.push({ command: header.slice(14).toUpperCase(), value: req.headers[header] });
      }
    });

    // Forward query
    if (customHeaders.length === 0) {
      next();
      return;
    }

    // debug(this.commands);
    let byPass = false;

    customHeaders.forEach((header) => {
      const command = this.commands.filter(cmd => cmd.command === header.command);

      if (command.length !== 0) {
        debug(`Emitting '${header.command}'`);
        this.emit(header.command, {
          command: header.command,
          value: header.value,
          req,
          res,
          next,
        });
        if (command[0].bypassQuery && !command[0].waitForContinue) {
          this._ignoreQuery(req, res);
          byPass = true;
        }
      } else {
        this.logger.warn(`Not registered header found '${header.command}'`);
        // this.logger.warn(`Command '${header.command}' not handled!`);
      }
    });

    if (!byPass) {
      next();
    }
  }

  /**
   * Add handling new header
   *
   * @param {{command: string, bypassQuery: boolean, waitForContinue: boolean}} Options Options for handling new header
   */
  registerCommand({ command, bypassQuery = true, waitForContinue = false }) {
    debug('registerCommand');
    debug(command.toUpperCase(), bypassQuery);
    const newCommand = command.trim().toUpperCase();

    if (newCommand.length === 0) {
      throw new Error('Impossible to register command because there is none!');
    }

    // TODO: Verify if command is in array and avoid adding another one (first in wins!)
    this.commands.push({ command: newCommand, bypassQuery, waitForContinue });
  }

  // Answer to client without doing any external call
  _ignoreQuery(req, res) {
    debug('ignoreQuery due to autopilot headers');
    if (!res.finished) {
      res.statusCode = 204;
      res.end(null);
    }
  }
}

module.exports = function setup(options, imports, register) {
  const autopilot = new ConfigLoader(imports);

  register(null, {
    autopilot,
  });
};
