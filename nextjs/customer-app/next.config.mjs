/** @type {import('next').NextConfig} */
const nextConfig = {  images: {
  remotePatterns: [
    // {
    //   protocol: 'https',
    //   hostname: 'aqua-famous-sailfish-288.mypinata.cloud',
    //   port: '',
    //   pathname: '/ipfs/**',
    // },
    {
      protocol: 'https',
      hostname: '*'
    },
  ],
  dangerouslyAllowSVG: false,
  contentDispositionType: 'attachment',
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
},
// experimental: {
//   missingSuspenseWithCSRBailout: false,
// },
};


export default nextConfig;
