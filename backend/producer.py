import json
import time
import random
import socket
from confluent_kafka import Producer

# 1. Setup the Confluent Kafka Producer
conf = {
    'bootstrap.servers': 'localhost:9092',
    'client.id': socket.gethostname()
}

producer = Producer(conf)
topic_name = 'raw_threat_logs'

# Callback to confirm message delivery
def delivery_callback(err, msg):
    if err:
        print(f"ERROR: Message failed delivery: {err}")
    else:
        print(f"SUCCESS: Streamed to topic {msg.topic()} from IP {json.loads(msg.value().decode('utf-8'))['source_ip']}")

# 2. Fake Threat Data Generator
def generate_fake_threat():
    attack_types = ['DDoS', 'SQL_Injection', 'Port_Scan', 'Malware_Drop', 'Brute_Force']
    
    return {
        "source_ip": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
        "dest_ip": "10.0.0.1",
        "source_lat": round(random.uniform(-90.0, 90.0), 4),
        "source_long": round(random.uniform(-180.0, 180.0), 4),
        "dest_lat": 28.7041,
        "dest_long": 77.1025,
        "attack_type": random.choice(attack_types),
        "timestamp": int(time.time()),
        "severity": round(random.uniform(0.1, 0.5), 2)
    }

print("Confluent Kafka Producer starting... Press Ctrl+C to stop.")

try:
    while True:
        threat_data = generate_fake_threat()
        # Convert dictionary to JSON string, then encode to bytes
        json_data = json.dumps(threat_data).encode('utf-8')
        
        # Send data
        producer.produce(topic=topic_name, value=json_data, callback=delivery_callback)
        
        # Serve delivery callback queue
        producer.poll(0)
        
        time.sleep(1)

except KeyboardInterrupt:
    print("\nStreaming stopped. Flushing pending messages...")
finally:
    # Ensure all messages are sent before closing
    producer.flush()