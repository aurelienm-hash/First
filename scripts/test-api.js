const https = require("https")

const testAPI = async () => {
  const baseUrl = process.argv[2] || "http://localhost:3000"

  console.log(`🧪 Testing API at: ${baseUrl}`)
  console.log("=".repeat(50))

  try {
    // Test 1: Health check
    console.log("1. Testing health endpoint...")
    const healthResponse = await fetch(`${baseUrl}/api/health`)
    const healthData = await healthResponse.json()

    if (healthResponse.ok) {
      console.log("✅ Health check passed")
      console.log(`   Environment: ${healthData.environment}`)
      console.log(`   Has OpenAI Key: ${healthData.hasOpenAIKey}`)
    } else {
      console.log("❌ Health check failed")
      return
    }

    // Test 2: OpenAI API test
    console.log("\n2. Testing OpenAI API connection...")
    const openaiResponse = await fetch(`${baseUrl}/api/test-openai`)
    const openaiData = await openaiResponse.json()

    if (openaiData.success) {
      console.log("✅ OpenAI API test passed")
      console.log(`   Has gpt-image-1 model: ${openaiData.hasGptImage1}`)
    } else {
      console.log("❌ OpenAI API test failed")
      console.log(`   Error: ${openaiData.error}`)
      if (openaiData.details) {
        console.log(`   Details: ${openaiData.details}`)
      }
    }

    console.log("\n" + "=".repeat(50))
    console.log(openaiData.success ? "🎉 All tests passed!" : "⚠️  Some tests failed")
  } catch (error) {
    console.log("❌ Connection error:", error.message)
    console.log("\n💡 Make sure the server is running and accessible")
  }
}

testAPI()
