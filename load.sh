#list load3 &
for i in {1..2}
do
        echo "*********** Cycle: $i **************"
#        list load1 &
		node ./packages/cli/simple.js &
        sleep 10
#        list load2 &
#        sleep 10
#        list load4 &
#        sleep 10
done
sleep 30
echo '*****************************'
echo '*****************************'
echo '*****************************'
echo 'STARTED'
echo '*****************************'
echo '*****************************'
echo '*****************************'
