const { resolve } = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { readdirSync, statSync } = require('fs');

function page (path, name) {
	return new HtmlWebpackPlugin({
		hash: true,
		template: path + '/' + name,
		filename:  name,
	});
}

const pages = [{path: './src', name: 'index.html'}];
readdirSync('./src/pages')
	.filter(dir => statSync('./src/pages' + '/' + dir).isDirectory())
	.forEach(dir => {
		readdirSync('./src/pages/' + dir)
			.filter(file => file.match(/.html$/))
			.forEach(file => pages.push({path: './src/pages/' + dir, name: file}))
		;
	})
;
const htmls = pages.map(file => page(file.path, file.name));


module.exports = env => ({

	entry: {
		styles: './src/styles/styles.scss',
		main: './src/scripts/main.ts',
	},

	output: {
		path: resolve('docs'),
		filename: '[name].[chunkhash].js',
	},

	optimization: {
		minimize: false,
	},

	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						}
					}],
				}),
			},
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						}
					}, {
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					}],
				}),
			},
			{
				test: /\.html$/,
				include: [
					resolve(__dirname, 'src/pages'),
					resolve(__dirname, 'src/templates'),
				],
				use: ['html-loader?interpolate'],
			},
			{
				loader: 'file-loader',
				include: [
					resolve(__dirname, 'src/assets'),
				],
				options: {
					outputPath: 'assets/',
					publicPath: 'assets/',
					name: '[name].[ext]',
					esModule: false,
				},
			},
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			}
		],
	},
	resolve: {
		extensions: [ '.ts', '.js' ],
	},

	plugins: [
		...htmls,
		new ExtractTextPlugin('styles.css'),
	].concat(env === 'prod' ? new CleanWebpackPlugin() : []),
});
