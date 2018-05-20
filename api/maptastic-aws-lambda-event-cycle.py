import time
import urllib2
import json
import boto3

QUEUE_URL = "ADD YOUR QUEUE URL HERE"

#Base GEO JSON format
geo_json_resp = { "crs": { "properties": { "name": ""},
                           "type": "name"
                         },
                  "features": []
                }

INCIDENT_ID_LIST = [   '_3SA0QDBKY',
                  '_3OY0IDELD',
                  '_3R41FEKDM',
                  '_3PJ0W9YPF',
                  '_3QN1FEHK2',
                  '_3PS0IZXB8',
                  '_3XW0FN4VB',
                  '_3PT0QVHNL',
                  '_3PS0J22AY',
                  '_3QJ1FBKQI',
                  '_3RY0LVTGL',
                  '_3PP0ZFDZ9',
                  '_3PG11D0SX',
                  '_3PJ18BA2P',
                  '_3QA0Q9COM',
                  '_3QM1FATIC',
                  '_3QI1FHIOS',
                  '_3QD0YYF0E',
                  '_3PL0S1D8O',
                  '_3RY0LVYOJ',
                  '_3PP12PEYT',
                  '_3PI0LXXPV',
                  '_3PS0KBU9R',
                  '_3S218JP5O',
                  '_3QI1FHZ80',
                  '_3RH1FEGC6',
                  '_3RK1FC4AJ',
                  '_3QX1F8RQO',
                  '_3PK0VEW26',
                  '_3PX0L0K02',
                  '_3PT0WHDL0',
                  '_3TN0M69RH',
                  '_3QL1FBJV1',
                  '_3RI1FBISI',
                  '_3PL0NWT4Z',
                  '_3PP0TS6LY',
                  '_3R21FCB9N',
                  '_3RT1FA99N',
                  '_3QI1FHITZ',
                  '_3QI1FHITK']

base_incident_url = 'https://ckan.smartcolumbusos.com/api/action/datastore_search_sql?sql=SELECT%20%22inci_id%22,%22Lat%22,%22Lon%22,%22alarm_date%22,%22alarm_time%22,%22arrive_dat%22,%22arrive_tim%22,%22clear_date%22,%22clear_time%22,%22incident_n%22,%22Incident_T%22,%22Incident_1%22,%22Year%22%20FROM%20%223605e929-c1ab-47bc-9891-cc8ab235d03b%22%20WHERE%20"inci_id"=%27{{inc_id}}%27%20ORDER%20BY%20%22alarm_date%22,%22alarm_time%22%20LIMIT%205;'

def lambda_handler(event, context):
    
    #Pull an incident Id from an AWS SQS queue
    incident_id = getIncidentId(QUEUE_URL)

    # incident_url = base_incident_url.replace("{{inc_id}}", getIncidentId())
    incident_url = base_incident_url.replace("{{inc_id}}", incident_id)

    req = urllib2.Request(incident_url)
    handler = urllib2.urlopen(req)
    translated_resp = geo_json_resp
    translated_resp["time"] = time.asctime( time.localtime(time.time()) )
        
    scos_resp = handler.read()
    scos_resp = json.loads(scos_resp)

    #Translate response from SCOS into GEO JSON format
    #Translate each record into the response into a GEO JSON feature
    for record in scos_resp['result']['records']:
        translated_resp['time'] = time.asctime( time.localtime(time.time()) )
        translated_resp['features'].append(gen_feature({'lon': record['Lon'],
                                                        'lat': record['Lat'],
                                                        'arrive_tim': record['arrive_tim'],
                                                        'arrive_dat': record['arrive_dat'],
                                                        'Incident_1': record['Incident_1'],
                                                        'clear_date': record['clear_date'],
                                                        'Year': record['Year'],
                                                        'Incident_T': record['Incident_T'],
                                                        'alarm_time': record['alarm_time'],
                                                        'inci_id': record['inci_id'],
                                                        'incident_n': record['incident_n'],
                                                        'clear_time': record['clear_time'],
                                                        'alarm_date': record['alarm_date']})
                                           )
    return translated_resp
    
def gen_feature(inc_dict):
    """
        Generates a GEO JSON feature.
    """
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [inc_dict['lon'], inc_dict['lat']]
        },
        "properties": inc_dict}

    return feature
    
def populateQueue(queue_url, incident_list):
    """
        Populates an AWS SQS queue with a list of incident Id's
    """

    # Get the service resource
    sqs = boto3.client('sqs')

    # Create a new message
    for incident in incident_list:
        response = sqs.send_message(QueueUrl=queue_url, MessageBody=incident)
        
def getIncidentId(queue_url):
    """
        Pulls an incent Id off of the queue.
    """
    # Get the service resource
    sqs = boto3.client('sqs')
    
    #Pull a message from the queue and store message information
    incident_id = sqs.receive_message(QueueUrl=queue_url)
    
    #Expect a KeyError if the queue is empty
    #If empty populate the queue and pull a message
    try:
        incident_id['Messages']
    except KeyError: 
        populateQueue(QUEUE_URL, INCIDENT_ID_LIST)
        incident_id = sqs.receive_message(QueueUrl=queue_url)
        
    print incident_id
    #Delete the message from the queue
    sqs.delete_message(QueueUrl=queue_url,
     ReceiptHandle=incident_id['Messages'][0]['ReceiptHandle'])

    #Returns the indicident Id stored in the body 
    #of the message store in the queue
    return incident_id['Messages'][0]['Body']