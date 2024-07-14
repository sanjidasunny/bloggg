import axios from 'axios';
import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config';
import { getAccessToken, getType } from '../utils/common-utils';

const API_URL = 'https://backend-kappa-liart.vercel.app/';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "content-type": "application/json"
    }
});

axiosInstance.interceptors.request.use(
    function(config) {
        if (config.TYPE.params) {
            config.params = config.TYPE.params;
        } else if (config.TYPE.query) {
            config.url = config.url + '/' + config.TYPE.query;
        }
        return config;
    },
    function(error) {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    function(response) {
        return processResponse(response);
    },
    function(error) {
        return Promise.reject(ProcessError(error));
    }
);

const processResponse = (response) => {
    if (response.status === 200 || response.status === 201) {
        return { isSuccess: true, data: response.data };
    } else {
        return {
            isFailure: true,
            status: response.status,
            msg: response.data?.message || API_NOTIFICATION_MESSAGES.responseFailure,
            code: response.status
        };
    }
};

const ProcessError = async (error) => {
    if (error.response) {
        if (error.response.status === 401) {
            // Unauthorized access handling (e.g., clear session)
            sessionStorage.clear();
            console.log("Unauthorized access detected. Session cleared.");
            return {
                isError: true,
                msg: "Unauthorized: Please log in again.",
                code: 401
            };
        } else if (error.response.status === 403) {
            // Handle other specific status codes as needed
            console.log("Forbidden: ", error.response.data?.message);
        } else {
            console.log("Error Response Status: ", error.response.status);
        }

        console.log("ERROR IN RESPONSE: ", error.toJSON());
        return {
            isError: true,
            msg: error.response.data?.message || API_NOTIFICATION_MESSAGES.responseFailure,
            code: error.response.status
        };
    } else if (error.request) {
        console.log("ERROR IN REQUEST: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.requestFailure,
            code: ""
        };
    } else {
        console.log("ERROR: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.networkError,
            code: ""
        };
    }
};

const API = {};

for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) => {
        const requestData = {
            method: value.method,
            url: value.url,
            responseType: value.responseType,
            headers: {
                authorization: getAccessToken(),
            },
            TYPE: getType(value, body),
        };

        // Handle data payload for DELETE requests
        if (value.method === 'DELETE') {
            requestData.data = undefined; // No data payload for DELETE requests
        } else {
            requestData.data = body;
        }

        // Handle upload and download progress if provided
        if (showUploadProgress) {
            requestData.onUploadProgress = function(progressEvent) {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                showUploadProgress(percentCompleted);
            };
        }

        if (showDownloadProgress) {
            requestData.onDownloadProgress = function(progressEvent) {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                showDownloadProgress(percentCompleted);
            };
        }

        return axiosInstance(requestData);
    };
}


export { API };
