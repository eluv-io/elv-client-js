/**
 * Methods related to notifications for the current user.
 *
 * @module Notifications
 */


const Utils = require("../Utils");
const UrlJoin = require("url-join");

const NotificationPath = ({network, path}) => {
  return UrlJoin("/push", network === "main" ? "/main" : "/dv3", path);
};

/**
 * Push a notification to the current user
 *
 * @methodGroup Notifications
 * @param {string} tenantId - The tenant associated with this notification
 * @param {string} eventType - The type of the notification
 * @param {(Object | string)=} data - Data associated with this notification
 */
exports.PushNotification = async function({tenantId, eventType, data}) {
  await this.stateStoreClient.Request({
    method: "POST",
    path: NotificationPath({network: this.network, path: UrlJoin("notify_user", this.UserAddress(), tenantId, eventType)}),
    body: data,
    headers: {
      Authorization: `Bearer ${this.AuthToken()}`
    }
  });
};

/**
 * Add a listener to receive new notifications.
 *
 * @methodGroup Notifications
 * @param {function} onMessage - Callback invoked when a new notification is received
 *
 * @returns {Promise<EventSource>} - An EventSource instance listening for notifications. Use source.close() to close the listener.
 */
exports.AddNotificationListener = async function({onMessage}) {
  if(!onMessage) {
    throw Error("Eluvio Wallet Client: No onMessage callback provided to AddNotificationListener");
  }

  const url = new URL(this.stateStoreClient.BaseURI().toString());
  url.pathname = NotificationPath({network: this.network, path: UrlJoin("register", this.UserAddress(), this.AuthToken())});
  const source = new EventSource(url);
  source.onmessage = event => {
    let parsedMessage = JSON.parse(event.data);

    try {
      parsedMessage.data = JSON.parse(parsedMessage.data);
    // eslint-disable-next-line no-empty
    } catch(error) {}

    onMessage(parsedMessage);
  };

  return source;
};

/**
 * Retrieve notifications for the current user.
 *
 * @methodGroup Notifications
 * @param {integer=} limit=10 - The maximum number of notifications to return
 * @param {string=} tenantId - Filter notifications to only those related to the specified tenant
 * @param {Array<string>=} types - Filter notifications to only the specified types
 * @param {string=} offsetId - Return notifications older than the specified ID
 *
 * @returns {Promise<Array<Object>>} - A list of notifications for the specified parameters
 */
exports.Notifications = async function({tenantId, types, offsetId, limit=10}={}) {
  let queryParams = { limit };

  if(tenantId) {
    queryParams.tenant_id = tenantId;
  }

  if(types) {
    queryParams.types = Array.isArray(types) ? types.join(",") : types;
  }

  if(offsetId) {
    queryParams.offset_by = offsetId;
  }

  const {records} = await Utils.ResponseToJson(
    this.stateStoreClient.Request({
      method: "GET",
      path: NotificationPath({network: this.network, path: UrlJoin("history", this.UserAddress())}),
      queryParams,
      headers: {
        Authorization: `Bearer ${this.AuthToken()}`
      }
    })
  );

  return records.map(record => {
    try {
      record.data = JSON.parse(record.data);
    // eslint-disable-next-line no-empty
    } catch(error) {}

    return record;
  });
};
