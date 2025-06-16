// AWS Configuration settings

// API Gateway URL - Replace with your actual API Gateway URL
export const API_GATEWAY_URL = 'https://xmiq38j6tj.execute-api.eu-west-2.amazonaws.com/prod/';

// Region settings
export const REGION = 'eu-west-2';

// User authentication configuration
export const AUTH_CONFIG = {
  userPoolId: 'eu-west-2_wnYIPiweh',
  userPoolClientId: '2edmdoeh5e6k1dp55p96gs4074',
  identityPoolId: 'eu-west-2:feaa8d45-e184-4754-b530-1d632a56c7c3',
};

// Email verification API endpoint
export const EMAIL_VERIFICATION_API_ENDPOINT = 'https://ys08te8gxf.execute-api.eu-west-2.amazonaws.com/prod/';

// Athlethium API endpoint
export const ATHLETHIUM_API_ENDPOINT = 'https://xmiq38j6tj.execute-api.eu-west-2.amazonaws.com/prod/';

// Bedrock agent function configuration
export const BEDROCK_AGENT_FUNCTION_ARN = 'arn:aws:lambda:eu-west-2:015894640590:function:bedrock_agent';
export const BEDROCK_AGENT_FUNCTION_URL = 'https://pod6g4bdl32qksz57kahli2y5a0oelmk.lambda-url.eu-west-2.on.aws/';

// S3 bucket configuration
export const S3_CONFIG = {
  userFilesBucket: 'your-user-files-bucket-name',
};

// Bedrock configuration
export const BEDROCK_CONFIG = {
  region: 'eu-west-2',
};