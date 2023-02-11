const path = require('path');

module.exports = {
	mode: 'development',
	output: {
		path: path.join(__dirname, 'www/js'),
		publicPath: 'js',
	},
	module: {
		rules: [
			{
				test: /\.(js)?$/,
				exclude: /(node_modules)/,
				use: 'babel-loader',
			},
		],
	},
	optimization: {
		minimize: false,
	},
	resolve: {
		extensions: ['.js', '.mdx'],
	},
	devtool: 'source-map',
	plugins: [],
};
