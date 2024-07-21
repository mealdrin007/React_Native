class HttpClient {
  fetchURL(url: any, token: any, parameter?: any, methodtype?: any) {
    return fetch(url, {
      method: methodtype,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: parameter,
    })
      .then(responseData => responseData.json())
      .then(async responseJson => {
        return responseJson;
      })
      .catch(error => {
        return {
          error: 'An error has occured '+error
        };
      });
  }

  fetchURLWithoutToken(url: any, parameter?: any, methodtype?: any) {
    return fetch(url, {
      method: methodtype,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: parameter,
    })
      .then(responseData => responseData.json())
      .then(async responseJson => {
        return responseJson;
      })
      .catch(error => {
        return {
          error: 'An error has occured: '+error,
        };
      });
  }
}

export default HttpClient;
