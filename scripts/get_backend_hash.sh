for LOCATION in fmt va1 fra tk7
do
  for NODE in 201 202 203 204 205 206
  do
    echo $(curl -sk https://node$NODE.$LOCATION.litecoinspace.org/api/v1/backend-info)
  done
done