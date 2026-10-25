import assert from 'node:assert/strict'
import test from 'node:test'
import { learningResourcesFor } from '../src/jobs-dashboard/learningResources.ts'

test('learning resources are relevant, secure, attributed, and honest without affiliate configuration', () => {
  const resources = learningResourcesFor('Data Engineer analytics AI', 8)
  assert.equal(resources.length, 8)
  assert.ok(resources.some((resource) => resource.provider === 'Grow with Google'))
  resources.forEach((resource) => {
    const url = new URL(resource.url)
    assert.equal(url.protocol, 'https:')
    assert.equal(url.searchParams.get('utm_source'), 'global-ai-jobs-impact-dashboard')
    assert.equal(url.searchParams.get('utm_campaign'), 'career-transition-planner')
    assert.equal(resource.sponsored, false)
  })
})

test('role-specific learning paths cover operations, cloud, and education transitions', () => {
  assert.ok(learningResourcesFor('Customer Operations support').some((resource) => resource.id === 'microsoft-ai-fluency'))
  assert.ok(learningResourcesFor('Cloud Solutions Architect').some((resource) => resource.id === 'aws-skill-builder'))
  assert.ok(learningResourcesFor('School Teacher education').some((resource) => resource.id === 'microsoft-ai-educators'))
})

test('India launch prioritizes official national learning platforms', () => {
  const resources = learningResourcesFor('India Customer Operations AI', 3)
  assert.ok(resources.some((resource) => resource.id === 'skill-india-digital'))
  assert.ok(resources.some((resource) => ['swayam-ai', 'nptel-computer-science'].includes(resource.id)))
})
