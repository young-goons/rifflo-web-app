import axios from 'axios';

import { EB_URL } from '../credentials';

export const BASE_URL = "http://127.0.0.1:5000";
// export const BASE_URL = EB_URL;

const instance = axios.create({
    baseURL: BASE_URL,
});

export default instance;
