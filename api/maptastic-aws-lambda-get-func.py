import urllib2
import json

#Base GEO JSON format
geo_json_resp = { "crs": { "properties": { "name": ""},
                           "type": "name"
                         },
                  "features": []
                }

SCOS_CRASH_URL = 'https://ckan.smartcolumbusos.com/api/action/datastore_search_sql?sql=SELECT%20%22DOCUMENT_NBR%22,%22CRASH_TYPE_CD%22,%22CRASH_YR%22,%22MONTH_OF_CRASH%22,%22DAY_IN_WEEK_CD%22,%22TIME_OF_CRASH%22,%22SEVERITY_BY_TYPE_CD%22,%22ODOT_LATITUDE_NBR%22,%22ODOT_LONGITUDE_NBR%22%20from%20%220b00e760-3bb0-4908-9983-04ea31a6665c%22%20WHERE%20%22CRASH_YR%22%20LIKE%20%27{{year}}%27%20AND%20%22MONTH_OF_CRASH%22%20LIKE%20%27{{month}}%27%20AND%20%22ODOT_LATITUDE_NBR%22%20%3C%3E%20%27%27%20LIMIT%2050'

def lambda_handler(event, context):
    year = event['year']
    month = event['month']
    scos_crash_url = SCOS_CRASH_URL.replace("{{year}}", year).replace("{{month}}", month)

    req = urllib2.Request(scos_crash_url)
    handler = urllib2.urlopen(req)
    translated_resp = geo_json_resp

    scos_resp = handler.read()
    scos_resp = json.loads(scos_resp)

    #Translate response from SCOS into GEO JSON format
    for record in scos_resp['result']['records']:
        translated_resp['features'].append(gen_feature(record['ODOT_LATITUDE_NBR'],
                                                  record['ODOT_LONGITUDE_NBR'],
                                                  record['CRASH_TYPE_CD'],
                                                  record['SEVERITY_BY_TYPE_CD'],
                                                  record['CRASH_YR'],
                                                  record['MONTH_OF_CRASH'],
                                                  record['DAY_IN_WEEK_CD'])
                                           )
    return translated_resp

def gen_feature(lat, lon, crash_type, crash_sev, year, month, day):
    """
        Generates a GEO JSON feature.
    """
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
        },
        "properties": {
            "crash-type": crash_type,
            "crash-severity": crash_sev,
            "Year": year,
            "Month": month,
            "Day_In_Week": day}
    }

    return feature