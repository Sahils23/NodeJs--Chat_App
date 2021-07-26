#include<iostream>
using namespace std;

int main(){
  int x,y,z;
  x=y=z=1;
  z= ++x || ++y && ++z;
  cout<<x<<y<<z;
return 0;
}