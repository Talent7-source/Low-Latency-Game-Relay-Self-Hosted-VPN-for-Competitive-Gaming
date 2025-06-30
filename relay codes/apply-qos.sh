#!/bin/bash

# Clear existing rules
tc qdisc del dev eth0 root

# HTB queuing discipline
tc qdisc add dev eth0 root handle 1: htb default 30

# Main class
tc class add dev eth0 parent 1: classid 1:1 htb rate 1000mbit ceil 1000mbit

# Game traffic class (highest priority)
tc class add dev eth0 parent 1:1 classid 1:10 htb rate 800mbit ceil 1000mbit prio 0
tc filter add dev eth0 protocol ip parent 1:0 prio 0 u32 match ip dport 27000:27200 0xffff flowid 1:10

# VoIP traffic class
tc class add dev eth0 parent 1:1 classid 1:20 htb rate 100mbit ceil 200mbit prio 1
tc filter add dev eth0 protocol ip parent 1:0 prio 1 u32 match ip dport 5060 0xffff flowid 1:20

# Default class
tc class add dev eth0 parent 1:1 classid 1:30 htb rate 100mbit ceil 200mbit prio 2
