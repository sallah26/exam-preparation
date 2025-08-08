require('dotenv').config();
const jwt = require('jsonwebtoken');

function testJWT() {
  console.log('🔍 Testing JWT functionality...');
  
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const issuer = process.env.JWT_ISSUER || 'addis-admin';
  const audience = process.env.JWT_AUDIENCE || 'addis-admin-users';
  
  console.log('📋 JWT Configuration:');
  console.log(`   Access Secret: ${accessSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Refresh Secret: ${refreshSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Access Expires: ${accessExpiresIn}`);
  console.log(`   Refresh Expires: ${refreshExpiresIn}`);
  console.log(`   Issuer: ${issuer}`);
  console.log(`   Audience: ${audience}`);
  
  if (!accessSecret || !refreshSecret) {
    console.log('❌ JWT secrets are missing!');
    return;
  }
  
  try {
    // Test payload
    const payload = {
      adminId: 'test-id',
      email: 'test@example.com',
      fullName: 'Test User',
      type: 'access'
    };
    
    console.log('\n🔐 Testing JWT signing...');
    
    // Test access token generation
    const accessToken = jwt.sign(payload, accessSecret, {
      expiresIn: accessExpiresIn,
      issuer: issuer,
      audience: audience,
    });
    
    console.log('✅ Access token generated successfully');
    console.log(`   Token: ${accessToken.substring(0, 50)}...`);
    
    // Test refresh token generation
    const refreshPayload = { ...payload, type: 'refresh' };
    const refreshToken = jwt.sign(refreshPayload, refreshSecret, {
      expiresIn: refreshExpiresIn,
      issuer: issuer,
      audience: audience,
    });
    
    console.log('✅ Refresh token generated successfully');
    console.log(`   Token: ${refreshToken.substring(0, 50)}...`);
    
    // Test token verification
    console.log('\n🔍 Testing JWT verification...');
    
    const decodedAccess = jwt.verify(accessToken, accessSecret, {
      issuer: issuer,
      audience: audience,
    });
    
    console.log('✅ Access token verified successfully');
    console.log(`   Decoded: ${JSON.stringify(decodedAccess, null, 2)}`);
    
    const decodedRefresh = jwt.verify(refreshToken, refreshSecret, {
      issuer: issuer,
      audience: audience,
    });
    
    console.log('✅ Refresh token verified successfully');
    console.log(`   Decoded: ${JSON.stringify(decodedRefresh, null, 2)}`);
    
    console.log('\n🎉 All JWT tests passed!');
    
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
    console.error(error.stack);
  }
}

testJWT(); 