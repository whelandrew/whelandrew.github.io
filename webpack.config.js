const webpack = require('webpack');

module.exports = {
  // 1
  entry: './src/index.js',
  // 2
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  // 3
  devServer: {
    contentBase: './dist'
  },
  resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
	  {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 8192
            }
          }
        ]
      },
	  {
		test: /\.css$/,
		use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
	  }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
	new webpack.ProvidePlugin({ auth0: 'auth0-js' }) ]
  ],
  devServer: {
    contentBase: './dist',
	hot: true
  }
};