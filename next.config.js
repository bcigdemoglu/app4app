const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */


const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    headers: async () => [
		{
			source: '/api/:path*',
			headers: [
                {   key: 'Access-Control-Allow-Credentials',
                    value: 'true'
                },
				{
					key: 'Access-Control-Allow-Origin',
                    value: 'https://www.ilayda.com'
				},
				{
					key: 'Access-Control-Allow-Methods',
					value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
				},
				{
					key: 'Access-Control-Allow-Headers',
					value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
				}
			]
		}
	],
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'avatars.githubusercontent.com'
          },
        ],
      },
};

module.exports = withContentlayer(nextConfig);
