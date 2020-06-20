from passporteye import read_mrz
import sys, json

def rename(old_dict,old_names,new_names):
    # neccessart for eslint errors
    new_dict = {}
    for index in range(len(old_names)):
        for key,value in zip(old_dict.keys(),old_dict.values()):
            new_key = key if key != old_names[index] else new_names[index]
            new_dict[new_key] = old_dict[key]
    return new_dict

def remove_old_key(new_dict, old_keys): 
     # neccessary for eslint errors

    for item in old_keys: 
        new_dict.pop(item)
    return new_dict

def passport_eye(image): 
    try: 
        data = read_mrz(image)
        if data == None:
            print('null')
        else:
            inDict = data.to_dict()
            renamed_dict = rename(inDict, ['valid_score', 'date_of_birth', 'expiration_date'], ['validScore', 'dateOfBirth', 'expire'])
            refined_dict = remove_old_key(renamed_dict, ['valid_score', 'date_of_birth', 'expiration_date'])
            dump = json.dumps(refined_dict)
            loaded_json = json.loads(dump)
            print(loaded_json)

    except FileNotFoundError as e:
        print(e)


passport_eye(sys.argv[1])
