expect = require 'expect.js'
methods = require('../methods')
process.env.NODE_ENV = 'test'

describe 'methods', ->
  before () ->
    methods.register 'onePlusTwo', (args) ->
      return args.one + args.two
    # methods.register 'callbackMethod', (args, callback) ->
    #   # Do something expensive

  describe 'server', ->
    describe 'call', ->
      it 'should return an error if the method is NOT registered', (done) ->
        methods.call 'fakeMethod', { one: 1 }, (err, res) ->
          expect(err).to.be('Method not found')
          expect(res).to.be(undefined)
          done()
      it 'should call a method if it IS registered', (done) ->
        methods.call 'onePlusTwo', { one: 1, two: 2 }, (err, res) ->
          expect(err).to.be(undefined)
          expect(res).to.be(3)
          done()
      # it 'should call a method that utilizes a callback', (done) ->
      #   methods.call 'callbackMethod', {}, (err, res) ->
      #     expect(err).to.be(undefined)
      #     done()
