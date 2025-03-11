import path from 'path';
import config from 'config';
process.env.NODE_CONFIG_DIR = path.join(__dirname, '../../config');

function getConfigDetails(): any {
  const ENV = config.get('ENV');
  if (!ENV) {
    throw new Error(`Enviroment variables not set for the instance`);
  }
  return ENV;
}

export default getConfigDetails();
