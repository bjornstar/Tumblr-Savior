VERSION=$1

echo "Building Tumblr Savior $VERSION"

cd src
zip ../Tumblr-Savior-$VERSION.zip ./* -r -9
cd ..
