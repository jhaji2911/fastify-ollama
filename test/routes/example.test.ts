import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../helper'

test('hello is loaded', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/hello'
  })

  assert.equal(res.payload, 'this is an hello')
})
