/*!
* Copyright (c) 2018-2019 Digital Bazaar, Inc. All rights reserved.
*/
import {EdvClient} from '..';
import mock from './mock.js';
import {isRecipient} from './test-utils.js';

const JWE_ALG = 'ECDH-ES+A256KW';

describe('Edv Recipients', () => {
  let invocationSigner, keyResolver = null;
  before(async () => {
    await mock.init();
    invocationSigner = mock.invocationSigner;
    keyResolver = mock.keyResolver;
  });
  after(async () => {
    await mock.server.shutdown();
  });

  // this test should be identical to the insert test
  // except that recipients is passed in
  it('should insert a document with a single recipient', async () => {
    const {keyAgreementKey} = mock.keys;
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = {id: testId, content: {someKey: 'someValue'}};
    const recipients = [{header: {kid: keyAgreementKey.id, alg: JWE_ALG}}];
    const inserted = await client.insert(
      {keyResolver, invocationSigner, doc, recipients});
    should.exist(inserted);
    inserted.should.be.an('object');
    inserted.id.should.equal(testId);
    inserted.sequence.should.equal(0);
    inserted.indexed.should.be.an('array');
    inserted.indexed.length.should.equal(1);
    inserted.indexed[0].should.be.an('object');
    inserted.indexed[0].sequence.should.equal(0);
    inserted.indexed[0].hmac.should.be.an('object');
    inserted.indexed[0].hmac.should.deep.equal({
      id: client.hmac.id,
      type: client.hmac.type
    });
    inserted.indexed[0].attributes.should.be.an('array');
    inserted.jwe.should.be.an('object');
    inserted.jwe.protected.should.be.a('string');
    inserted.jwe.recipients.should.be.an('array');
    inserted.jwe.recipients.length.should.equal(1);
    isRecipient({recipient: inserted.jwe.recipients[0]});
    inserted.jwe.iv.should.be.a('string');
    inserted.jwe.ciphertext.should.be.a('string');
    inserted.jwe.tag.should.be.a('string');
    inserted.content.should.deep.equal({someKey: 'someValue'});
  });

  it('should insert a document with multiple recipients', async () => {
    const {keyAgreementKey} = mock.keys;
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = {id: testId, content: {someKey: 'someValue'}};
    const recipients = [
      {header: {kid: keyAgreementKey.id, alg: JWE_ALG}},
      {header: {kid: 'did:key:KaK:1', alg: JWE_ALG}},
      {header: {kid: 'did:key:KaK:2', alg: JWE_ALG}},
      {header: {kid: 'did:key:KaK:3', alg: JWE_ALG}}
    ];
    const inserted = await client.insert(
      {keyResolver, invocationSigner, doc, recipients});
    should.exist(inserted);
    inserted.should.be.an('object');
    inserted.id.should.equal(testId);
    inserted.sequence.should.equal(0);
    inserted.indexed.should.be.an('array');
    inserted.indexed.length.should.equal(1);
    inserted.indexed[0].should.be.an('object');
    inserted.indexed[0].sequence.should.equal(0);
    inserted.indexed[0].hmac.should.be.an('object');
    inserted.indexed[0].hmac.should.deep.equal({
      id: client.hmac.id,
      type: client.hmac.type
    });
    inserted.indexed[0].attributes.should.be.an('array');
    inserted.jwe.should.be.an('object');
    inserted.jwe.protected.should.be.a('string');
    inserted.jwe.recipients.should.be.an('array');
    inserted.jwe.recipients.length.should.equal(1);
    isRecipient({recipient: inserted.jwe.recipients[0]});
    inserted.jwe.iv.should.be.a('string');
    inserted.jwe.ciphertext.should.be.a('string');
    inserted.jwe.tag.should.be.a('string');
    inserted.content.should.deep.equal({someKey: 'someValue'});
  });
});
