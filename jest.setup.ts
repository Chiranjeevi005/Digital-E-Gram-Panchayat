import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Fix for TextEncoder not being defined in Jest environment
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  Object.assign(global, { TextEncoder, TextDecoder });
}