we should add the following filters in the rental page 
MinPrice
MaxPrice
MinBedrooms
MaxBedrooms
MinBathrooms
MaxBathrooms
MinCapacity aka Adults
IsFeatured
HasSeaView
boolean
(query)

--
HasPoolView
boolean
(query)

--
HasGardenView
boolean
(query)

--
HasMountainView
boolean
(query)

--
HasCityView

could you create a plan so that we have them in the filters ? also the locaiotns should be added could you create a plan so that we add them and also the PropertyType esiplty the 1 bed room and the others 
create a plan 


GET
/api/properties/filter


Parameters
Cancel
Name	Description
PropertyType
integer($int32)
(query)

--
PropertyStatus
integer($int32)
(query)

--
Country
string
(query)
Country
City
string
(query)
City
Area
string
(query)
Area
MinPrice
number($double)
(query)
MinPrice
MaxPrice
number($double)
(query)
MaxPrice
MinBedrooms
integer($int32)
(query)
MinBedrooms
MaxBedrooms
integer($int32)
(query)
MaxBedrooms
MinBathrooms
integer($int32)
(query)
MinBathrooms
MaxBathrooms
integer($int32)
(query)
MaxBathrooms
MinRooms
integer($int32)
(query)
MinRooms
MaxRooms
integer($int32)
(query)
MaxRooms
MinCapacity
integer($int32)
(query)
MinCapacity
IsFeatured
boolean
(query)

--
IsAvailable
boolean
(query)

--
HasSeaView
boolean
(query)

--
HasPoolView
boolean
(query)

--
HasGardenView
boolean
(query)

--
HasMountainView
boolean
(query)

--
HasCityView
boolean
(query)

--
PageNumber
integer($int32)
(query)
PageNumber
PageSize
integer($int32)
(query)
PageSize
SortBy
string
(query)
SortBy
IsDescending
boolean
(query)

--
Accept-Language
string
(header)
Preferred language for response localization (en, fr, de, ru, ar). Default: en.


en
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://rentall.runasp.net/api/properties/filter' \
  -H 'accept: */*' \
  -H 'Accept-Language: en' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjAwNzVjZDNlLTBhZjEtNDU3OS1mMzQwLTA4ZGYyODVjZWJmMSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6InN1cGVyYWRtaW5AcHJvcGVydHltYW5hZ2VtZW50LmNvbSIsInVzZXJJZCI6IjAwNzVjZDNlLTBhZjEtNDU3OS1mMzQwLTA4ZGYyODVjZWJmMSIsInVzZXJOYW1lIjoic3VwZXJhZG1pbiIsImZ1bGxOYW1lIjoiU3VwZXIgQWRtaW4iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTdXBlckFkbWluIiwiZXhwIjoxNzkyMzA5ODMzLCJpc3MiOiJQcm9wZXJ0eU1hbmFnZW1lbnRBUEkiLCJhdWQiOiJQcm9wZXJ0eU1hbmFnZW1lbnRDbGllbnRzIn0.K5j5GT-cYM3C1bBWc7mDJBAu6re95AJ655phWCAkcaQ'
Request URL
https://rentall.runasp.net/api/properties/filter
Server response
Code	Details
200	
Response body
Download
{
  "data": {
    "items": [
      {
        "id": "d52891f0-acc5-4a49-a406-cdebfb1dcb92",
        "propertyNumber": "PR-000001",
        "code": "406",
        "name": "Regency - Apartment - Unit 406",
        "bedroomNo": 1,
        "bathroomNo": 1,
        "size": 50,
        "capacity": 2,
        "basePriceInfo": {
          "baseAmount": 50,
          "baseCurrency": "USD",
          "amount": 50,
          "currency": "USD",
          "conversionRate": 1,
          "currencySymbol": "$"
        },
        "propertyType": 1,
        "propertyTypeName": "Apartment",
        "propertyStatus": "Clean",
        "isAvailable": true,
        "isFeatured": true,
        "coverImageUrl": null,
        "city": "Hurghada",
        "country": "Egypt",
        "createdAtUtc": "2026-10-15T09:33:51.4959174"
      },
      {
        "id": "6e76552a-a3d1-436f-8d41-23de8332f2eb",
        "propertyNumber": "PR-000002",
        "code": "SEED-VILLA-ELFAYROUZ",
        "name": "Villa in El Fayrouz",
        "bedroomNo": 3,
        "bathroomNo": 3,
        "size": 220,
        "capacity": 6,
        "basePriceInfo": {
          "baseAmount": 850,
          "baseCurrency": "USD",
          "amount": 850,
          "currency": "USD",
          "conversionRate": 1,
          "currencySymbol": "$"
        },
        "propertyType": 2,
        "propertyTypeName": "Villa",
        "propertyStatus": "Clean",
        "isAvailable": true,
        "isFeatured": true,
        "coverImageUrl": null,
        "city": null,
        "country": null,
        "createdAtUtc": "2026-10-17T09:08:32.8432137"
      },
      {
        "id": "bf4bf002-5dce-4ee7-a7b9-cf3a659bfafa",
        "propertyNumber": "PR-000003",
        "code": "SEED-APT-ELGOUNA",
        "name": "Apartment in ElGouna",
        "bedroomNo": 2,
        "bathroomNo": 2,
        "size": 140,
        "capacity": 4,
        "basePriceInfo": {
          "baseAmount": 520,
          "baseCurrency": "USD",
          "amount": 520,
          "currency": "USD",
          "conversionRate": 1,
          "currencySymbol": "$"
        },
        "propertyType": 1,
        "propertyTypeName": "Apartment",
        "propertyStatus": "Clean",
        "isAvailable": true,
        "isFeatured": true,
        "coverImageUrl": null,
        "city": null,
        "country": null,
        "createdAtUtc": "2026-10-17T09:08:51.4028228"
      },
      {
        "id": "7eb964e3-ae18-46a5-9f1d-c3a8ac498664",
        "propertyNumber": "PR-000004",
        "code": "SEED-STUDIO-ELKAWTHER",
        "name": "Studio in ElKawther",
        "bedroomNo": 1,
        "bathroomNo": 1,
        "size": 75,
        "capacity": 2,
        "basePriceInfo": {
          "baseAmount": 310,
          "baseCurrency": "USD",
          "amount": 310,
          "currency": "USD",
          "conversionRate": 1,
          "currencySymbol": "$"
        },
        "propertyType": 3,
        "propertyTypeName": "Studio",
        "propertyStatus": "Clean",
        "isAvailable": true,
        "isFeatured": true,
        "coverImageUrl": null,
        "city": null,
        "country": null,
        "createdAtUtc": "2026-10-17T09:09:07.5259707"
      },