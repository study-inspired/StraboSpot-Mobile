import {useSelector} from 'react-redux';
import {Alert} from 'react-native';

const useServerRequests = () => {
  const user = useSelector(state => state.user);
  const baseUrl = 'https://strabospot.org/db';

  const authenticateUser = async (username, password) => {
    const authenticationBaseUrl = baseUrl.slice(0, baseUrl.lastIndexOf('/')); //URL to send authentication API call
    try {
      let response = await fetch(authenticationBaseUrl + '/userAuthenticate',
        {
          method: 'POST',
          headers: {
            // TODO: ?? does not work when Accept is uncommented ??
            // Accept: 'application/json; charset=UTF-8',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {email: username, password: password},
          ),
        },
      );
      let responseJson = await response.json();
      return responseJson.valid;
    }
    catch (error) {
      console.error(error);
      Alert.alert(error);
    }
  };

  const request = async (method, urlPart, login, data) => {
    const response = await timeoutPromise(10000, fetch(baseUrl + urlPart, {
      method: method,
      headers: {
        Authorization: 'Basic ' + login + '/',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }));
    return handleResponse(response);
  };

  const getDataset = (datasetId) => {
    return request('GET', '/dataset/' + datasetId);
  };

  const getDatasetSpots = (datasetId, encodedLogin) => {
    return request('GET','/datasetSpots/' + datasetId, encodedLogin);
  };

  const getProfileImage = async (encodedLogin) => {
    let imageBlob = null;
    try {
      let imageResponse = await fetch(baseUrl + '/profileimage', {
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: 'Basic ' + encodedLogin,
        },
      });
      if (imageResponse.status === 200) {
        imageBlob = imageResponse.blob();
        return imageBlob;
      }
      else {
        imageBlob = null;
      }
    }
    catch (error) {
      console.error(error);
    }
  };

  const getProfile = (encodedLogin) => {
    return request('GET', '/profile', encodedLogin);
  };

  const getProject = async (projectId, encodedLogin) => {
    return await request('GET', '/project/' + projectId, encodedLogin);
  };

  const getDatasets = async (projectId, encodedLogin) => {
    return request('GET', '/projectDatasets/' + projectId, encodedLogin);
  };

  const getMyProjects = (encodedLogin) => {
    return request('GET','/myProjects', encodedLogin);
  };

  const handleError = (response) => {
    if (!response.ok) {
      return Promise.reject('Error Retrieving Data!');
    }
  };

  const handleResponse = response => {
    if (response.ok) {
      return response.json();
    }
    else return handleError(response);
  };

  const timeoutPromise = (ms, promise) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        Alert.alert('There was an error getting your request');
        reject(new Error('promise timeout'));
      }, ms);
      promise.then((res) => {
          clearTimeout(timeout);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeout);
          reject(err);
        },
      );
    });
  };

  const updateProject = (project, encodedLogin) => {
    return request('POST', '/project', encodedLogin, project,);
  };

  const serverRequests = {
    getMyProjects: getMyProjects,
    getDatasets: getDatasets,
    getDatasetSpots: getDatasetSpots,
    getDataset: getDataset,
    getProfile: getProfile,
    getProject: getProject,
    getProfileImage: getProfileImage,
    updateProject: updateProject,
    authenticateUser: authenticateUser,
  };

  return [serverRequests];
};

export default useServerRequests;

