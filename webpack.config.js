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
				test: /\.ts$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
		],
	},
	optimization: {
		minimize: false,
	},
	resolve: {
		extensions: ['.js', '.ts', '.mdx'],
	},
	devtool: 'source-map',
	plugins: [],
};
