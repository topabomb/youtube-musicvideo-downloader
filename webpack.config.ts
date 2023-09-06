import * as path from 'path';
import * as webpack from 'webpack';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config: webpack.Configuration = {
  node: {
    global: true,
    __filename: true,
    __dirname: false,
  },
  target: 'node',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.node$/i,
        loader: 'node-loader',
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.cjs',
    chunkFormat: 'commonjs',
  },
};

export default config;
