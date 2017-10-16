import DraftStoreClient from 'common/draft/draftStoreClient'

import { Draft } from 'app/models/draft'
import { DraftDocument } from 'app/models/draftDocument'
import { DraftStoreClientFactory } from 'common/draft/draftStoreClientFactory'
import { CoreOptions, RequestAPI } from 'request'
import { RequestPromise } from 'request-promise-native'

export class DraftService {
  constructor (public draftStoreUri: string, public request: RequestAPI<RequestPromise, CoreOptions, CoreOptions>) {
    this.draftStoreUri = draftStoreUri
    this.request = request
  }

  async save<T extends DraftDocument> (draft: Draft<T>, userToken: string): Promise<void> {

    const client: DraftStoreClient<T> = await DraftStoreClientFactory.create<T>(this.draftStoreUri, this.request)
    return client.save(draft, userToken)
  }

  async delete<T extends DraftDocument> (draft: Draft<T>, userToken: string): Promise<void> {
    const client: DraftStoreClient<T> = await DraftStoreClientFactory.create<T>(this.draftStoreUri, this.request)
    return client.delete(draft, userToken)
  }
}
