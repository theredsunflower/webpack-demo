const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'sw.js',
    path: path.resolve(__dirname, 'dist')
  },
    devServer: {
        contentBase: './dist'
    },
  module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    'loader': 'babel-loader',
                    'options': {
                        'presets': [
                            'env'
                        ]
                    }
                }
            }
        ]
    }
};