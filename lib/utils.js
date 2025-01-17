/* eslint-env node */

'use strict';

const fs = require('fs');
const path = require('path');

const unique = function(array) {
  return array.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  });
};

const buildPolicyString = function(policyObject) {
  return Object.keys(policyObject).reduce(function(memo, name) {
    var value = policyObject[name];
    if (value === null) {
      // Override the default value of `'self'`. Instead no entry will be included
      // in the CSP. This, in turn, will cause the CSP to fallback to `default-src`
      // for this directive. http://www.w3.org/TR/CSP2/#default-src-usage
      return memo;
    } else {
      var sourceList = Array.isArray(value) ? unique(value).join(' ') : value;
      return memo + name + ' ' + sourceList + '; ';
    }
  }, '').trim();
};

const getConfigPath = function(projectPkg, projectRoot) {
  let configDir = 'config';

  if (projectPkg['ember-addon'] && projectPkg['ember-addon']['configPath']) {
    configDir = projectPkg['ember-addon']['configPath'];
  }

  return path.join(projectRoot, configDir, 'content-security-policy.js');
};

/**
 * Returns the configuration stored in `config/content-security-policy.js`.
 * Returns an empty object if that file does not exist.
 *
 * @param {string} projectRoot
 * @return {object}
 */
const readConfig = function(project, environment) {
  let configPath = getConfigPath(project.pkg, project.root);

  return fs.existsSync(configPath) ? require(configPath)(environment) : {};
};

module.exports = {
  buildPolicyString,
  readConfig
};
