const testDeployment = async () => {
  const siteUrl = process.argv[2]

  if (!siteUrl) {
    console.log("❌ Please provide the site URL")
    console.log("Usage: npm run deploy-test https://your-site.netlify.app")
    return
  }

  console.log(`🚀 Testing deployment at: ${siteUrl}`)
  console.log("=".repeat(60))

  const tests = [
    {
      name: "Site accessibility",
      url: siteUrl,
      test: (response) => response.ok,
    },
    {
      name: "Health endpoint",
      url: `${siteUrl}/api/health`,
      test: (response, data) => response.ok && data.status === "healthy",
    },
    {
      name: "OpenAI API connection",
      url: `${siteUrl}/api/test-openai`,
      test: (response, data) => response.ok && data.success,
    },
  ]

  let allPassed = true

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`)
      const response = await fetch(test.url)
      const data = response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : await response.text()

      if (test.test(response, data)) {
        console.log(`✅ ${test.name} - PASSED`)
        if (typeof data === "object" && data.message) {
          console.log(`   ${data.message}`)
        }
      } else {
        console.log(`❌ ${test.name} - FAILED`)
        if (typeof data === "object" && data.error) {
          console.log(`   Error: ${data.error}`)
        }
        allPassed = false
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`)
      allPassed = false
    }
    console.log("")
  }

  console.log("=".repeat(60))
  if (allPassed) {
    console.log("🎉 Deployment test completed successfully!")
    console.log("✅ Your application is ready to use")
  } else {
    console.log("⚠️  Some tests failed")
    console.log("💡 Check your environment variables in Netlify dashboard")
  }
}

testDeployment()
