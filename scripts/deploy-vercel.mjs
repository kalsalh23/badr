import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')

const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const PROJECT_ID = process.env.VERCEL_PROJECT_ID

if (!VERCEL_TOKEN || !PROJECT_ID) {
  console.error('VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables are required')
  process.exit(1)
}

function getAllFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllFiles(full, rel))
    } else {
      files.push({ rel, full })
    }
  }
  return files
}

function sha1hex(content) {
  return createHash('sha1').update(content).digest('hex')
}

async function main() {
  const files = getAllFiles(distDir)
  console.log(`Found ${files.length} files in dist/`)

  const fileInfos = files.map((f) => {
    const content = fs.readFileSync(f.full)
    return { file: f.rel, sha: sha1hex(content), size: content.length, full: f.full }
  })

  // Build the deployment payload using curl via PowerShell
  // Use a temp file for the JSON payload
  const payload = {
    name: 'iblagh-al-taybeh',
    project: PROJECT_ID,
    target: 'production',
    files: fileInfos.map(({ sha, file, size }) => ({ file, sha, size })),
  }

  const payloadPath = path.join(root, '.tmp-deploy-payload.json')
  fs.writeFileSync(payloadPath, JSON.stringify(payload))

  console.log('Creating deployment with curl...')

  // Use curl.exe (Windows has curl.exe built-in)
  const curlCmd = `curl.exe -s -X POST "https://api.vercel.com/v13/deployments" -H "Authorization: Bearer ${VERCEL_TOKEN}" -H "Content-Type: application/json" -d @"${payloadPath}"`

  try {
    const result = execSync(curlCmd, { encoding: 'utf8', timeout: 30000 })
    const parsed = JSON.parse(result)

    if (parsed.url) {
      console.log(`\n✅ Deployed: https://${parsed.url}`)
      console.log(`   ID: ${parsed.id}`)
      fs.unlinkSync(payloadPath)
      return
    }

    if (parsed.error?.missing) {
      const missing = parsed.error.missing
      console.log(`Need to upload ${missing.length} missing files...`)

      // Upload each file using curl
      let uploaded = 0
      for (const hash of missing) {
        const fi = fileInfos.find((f) => f.sha === hash)
        if (!fi) continue

        const uploadCmd = `curl.exe -s -X POST "https://api.vercel.com/v2/files" -H "Authorization: Bearer ${VERCEL_TOKEN}" -H "x-vercel-digest: ${hash}" -H "Content-Length: ${fi.size}" --data-binary "@${fi.full.replace(/\\/g, '/')}"`
        try {
          const uploadResult = execSync(uploadCmd, { encoding: 'utf8', timeout: 30000 })
          uploaded++
          process.stdout.write(`  ✓ ${uploaded}/${missing.length} ${fi.file}\n`)
        } catch (e) {
          console.error(`  ✗ ${fi.file}: upload failed`)
        }
      }

      console.log(`\nUploaded ${uploaded}/${missing.length} files. Retrying deployment...`)

      // Retry
      const retryCmd = `curl.exe -s -X POST "https://api.vercel.com/v13/deployments" -H "Authorization: Bearer ${VERCEL_TOKEN}" -H "Content-Type: application/json" -d @"${payloadPath}"`
      const retryResult = execSync(retryCmd, { encoding: 'utf8', timeout: 30000 })
      const retryParsed = JSON.parse(retryResult)

      if (retryParsed.url) {
        console.log(`\n✅ Deployed: https://${retryParsed.url}`)
      } else if (retryParsed.error?.missing) {
        console.error(`Still ${retryParsed.error.missing.length} files missing`)
      } else {
        console.error('Result:', JSON.stringify(retryParsed).slice(0, 300))
      }
    } else {
      console.error('Error:', JSON.stringify(parsed).slice(0, 500))
    }
  } catch (e) {
    console.error('curl failed:', e.message)
  }

  // Cleanup
  if (fs.existsSync(payloadPath)) fs.unlinkSync(payloadPath)
}

main().catch(console.error)
