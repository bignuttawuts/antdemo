import axios from 'axios';
import { Customer } from '../types/customers';

export const createCustomer = (customer: Customer) => axios.post('/.netlify/functions/customers', customer)