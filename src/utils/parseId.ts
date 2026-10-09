import {HttpError} from './HttpError';

export const parseId = (value: string): number => {
    const id = Number(value);
    if(!Number.isInteger(id) || id <= 0){
        throw new HttpError(400, 'Invalid ID');
    }
    return id;
};