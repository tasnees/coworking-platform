import { logger } from './src/utils/logger';

console.log('Testing logger...');

logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');

console.log('Test completed!');
