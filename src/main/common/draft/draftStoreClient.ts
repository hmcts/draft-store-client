import { Draft } from 'app/models/draft'
import { DraftDocument } from 'app/models/draftDocument'
import { CoreOptions, RequestAPI } from 'request'
import { RequestPromise } from 'request-promise-native'
import moment = require('moment')

export default class DraftStoreClient<T extends DraftDocument> {
  private serviceAuthToken: string
  private endpointURL: string
  private request: RequestAPI<RequestPromise, CoreOptions, CoreOptions>

  constructor (serviceAuthToken: string, endpointURL: string, request: RequestAPI<RequestPromise, CoreOptions, CoreOptions>) {
    this.serviceAuthToken = serviceAuthToken
    this.endpointURL = endpointURL
    this.request = request

  }

  find (query: { [key: string]: string }, userAuthToken: string, deserializationFn: (value: any) => T): Promise<Draft<T>[]> {
    const { type, ...qs } = query
    const endpointURL: string = `${this.endpointURL}/drafts`

    return this.request
      .get(endpointURL, {
        qs: qs,
        headers: this.authHeaders(userAuthToken)
      })
      .then((response: any) => {
        return response.data
          .filter(draft => type ? draft.type === type : true)
          .map(draft => {
            return new Draft(
              draft.id,
              draft.type,
              deserializationFn(draft.document),
              moment(draft.created),
              moment(draft.updated)
            )
          })
      })
  }

  save (draft: Draft<T>, userAuthToken: string): Promise<void> {
    const options = {
      headers: this.authHeaders(userAuthToken),
      body: {
        type: draft.type,
        document: draft.document
      }
    }

    if (!draft.id) {
      return this.request.post(this.endpointURL, options)
    } else {
      return this.request.put(`${this.endpointURL}/${draft.id}`, options)
    }
  }

  delete (draft: Draft<T>, userAuthToken: string): Promise<void> {
    if (!draft.id) {
      throw new Error('Draft does not have an ID - it cannot be deleted')
    }

    return this.request.delete(`${this.endpointURL}/${draft.id}`, {
      headers: this.authHeaders(userAuthToken)
    })
  }

  private authHeaders (userAuthToken: string) {
    return {
      'Authorization': `Bearer ${userAuthToken}`,
      'ServiceAuthorization': `Bearer ${this.serviceAuthToken}`
    }
  }
}
