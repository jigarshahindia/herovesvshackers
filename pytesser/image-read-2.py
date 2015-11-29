from pytesser import *
from PIL import Image, ImageChops
import sys
import os
import json
import base64
import re

if len(sys.argv)>1:
    inp = sys.argv[1]
else :
    inp = ''
  
  
if len(sys.argv)>2:
    out = sys.argv[2]
else :
    out = ''
  
if len(sys.argv)>3:
    docType = sys.argv[3]
else :
    docType = ""
  
def perform_cleanup(name):
	"""Clean up temporary files from disk"""
	try:
		os.remove(name)
	except OSError:
		pass

def is_there_a_border(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    return bbox 

def process_aadhar(image1):
	box = is_there_a_border(image1)
	image1 = image1.crop(box)
	image1 = image1.rotate(180)
	box1 = is_there_a_border(image1)
	image1 = image1.crop(box1)
	image1 = image1.rotate(180)
	#image1.save("output1.jpg", "JPEG")
	boxSize = image1.size
	box2 = ((boxSize[0]-1)*5/12,0,boxSize[0]-1,(boxSize[1]-1)*2/3)
	image1 = image1.crop(box2)
	#image1.save("output2.jpg", "JPEG")
	str1 = image_to_string(image1)
	arr1 = str1.split('\n')
	index = 0
	for str2 in arr1:
		pos = str2.find('Address')
		if pos > -1:
			strLen = len(str2) - 1
			arr1[index] = str2[pos+9:strLen]
			break
		else:
			arr1.pop(index)
		index += 1

	data = {}
	index = 0
	for str1 in arr1:
		if len(str1) == 0:	
			arr1.pop(index)
		index += 1
	if arr1 != "":
		data['address'] = arr1
		json_data = json.dumps(data)
	else:
		data['address'] = ""
		json_data = json.dumps(data)

	return json_data

def process_pan(image1):
	box = is_there_a_border(image1)
	image1 = image1.crop(box)
	image1 = image1.rotate(180)
	box1 = is_there_a_border(image1)
	image1 = image1.crop(box1)
	image1 = image1.rotate(180)
	image1.save("tempoutput1.jpg", "JPEG")
	str1 = image_to_string(image1)
	arr1 = str1.split('\n')
	index = 0
	json_data = {}
	for str2 in arr1:
		print str2
		pos = str2.find(' ')
		print str(pos)
		if pos == -1:
			strLen = len(str2)
			if strLen == 10: 
				data = {}
				data['pan'] = str2
				data['verified'] = verify_pan(str2)
				json_data = json.dumps(data)		
		index += 1

	return json_data

def verify_pan(panNo):
	p = re.compile('[A-Z]{5}[0-9]{4}[A-Z]{1}')
	out = p.match(panNo)
	if out == "None":
		status = "No"
	else:
		status = "Yes"
	return status

image1 = Image.open(inp)

if docType == "aadhar":
	json_data = process_aadhar(image1)
elif docType == "pan":
	json_data = process_pan(image1)
elif docType == "dl":
	json_data = process_dl
elif docType == "voterId":
	json_data = process_voterId
else:
	json_data = ""

	

fout = open(out, "w")
fout.write(json_data)
fout.close()
	
print str(json_data)
print "Done"
perform_cleanup("/home/user/Downloads/imageToSave.jpg")
