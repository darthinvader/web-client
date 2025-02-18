const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const path = require('path')
const webpack = require('webpack')

const devServer = {
  port: 8082,
  hot: true,
  headers: { 'Access-Control-Allow-Origin': '*' },
  static: { directory: path.join(__dirname, 'dev') },
}
require('dotenv').config({ path: './.devenv' })
module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'cheap-module-source-map',
  devServer,
  entry: {
    main: './src/index',
    example: './dev/example',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: '@botsquad/web-client',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: [/\.jsx?$/],
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
            },
          },
          'webpack-conditional-loader',
        ],
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /[^min]\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.min\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|gif|png|jpg|woff|woff2)$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
}

if (process.env.ANALYZE === 'true') {
  console.log('** Enabling bundle analyzer')
  module.exports.plugins.push(new BundleAnalyzerPlugin())
}
