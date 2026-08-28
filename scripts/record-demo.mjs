import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const output = execFileSync(resolve('target/debug/apg'), ['demo'], { encoding: 'utf8' })
const workspace = output.match(/^  workspace: (.+)$/m)?.[1]
if (!workspace) throw new Error('apg demo did not print a workspace path')

const normalized = output.replaceAll(workspace, '/tmp/apg-demo-…')
writeFileSync(resolve('site/demo-transcript.txt'), `$ apg demo\n${normalized}`)
